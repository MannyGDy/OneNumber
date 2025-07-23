import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import csvParser from 'csv-parser';
import PhoneNumber, { IPhoneNumber } from '../models/phoneNumber.model';
import User from '../models/user.model';

// Configure multer for file uploads


// update phone number status with usr reference
export const updatePhoneNumberStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;

    if (!['available', 'reserved', 'active', 'suspended'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const phoneNumber = await PhoneNumber.findById(id);

    if (!phoneNumber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    // If number is already assigned to another user, we need to handle that
    if (phoneNumber.user && phoneNumber.user.toString() !== userId && status !== 'available') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Phone number is already assigned to another user'
      });
    }

    // If number is changing from assigned to available, remove from previous user
    if (status === 'available' && phoneNumber.user) {
      await User.findByIdAndUpdate(
        phoneNumber.user,
        { $pull: { phoneNumbers: phoneNumber._id } }
      );

      // Update phone number
      phoneNumber.status = status;
      phoneNumber.user = null;
      phoneNumber.reservedUntil = null;
    }
    // If assigning to a user (reserved, active, suspended)
    else if (['reserved', 'active', 'suspended'].includes(status) && userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'User not found'
        });
      }

      // If this is a new assignment (not just a status change for same user)
      if (!phoneNumber.user || phoneNumber.user.toString() !== userId) {
        // Add to user's phone numbers array if not already there

        const userPhoneNumber = await User.findOne({ phoneNumber: phoneNumber.phoneNumber });

        if (!userPhoneNumber) {
          await User.findByIdAndUpdate(
            userId,
            { $set: { phoneNumber: phoneNumber._id } }
          );
        }
      }

      // Update phone number status
      phoneNumber.status = status;
      phoneNumber.user = userId;

      // Set reservation time if reserved
      if (status === 'reserved') {
        phoneNumber.reservedUntil = new Date(Date.now() + 30 * 60000); // 30 minutes
      } else {
        phoneNumber.reservedUntil = null;
      }
    }

    await phoneNumber.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Phone number status updated successfully',
      data: phoneNumber
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to update phone number status'
    });
  }
};

// Add a single phone number
export const addPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, type } = req.body;
   
    if (!phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Phone number is required'
      });

    }

    // Check if phone number already exists
    const existingNumber = await PhoneNumber.findOne({ phoneNumber });

    if (existingNumber) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Create new phone number
    const newPhoneNumber = await PhoneNumber.create({
      phoneNumber,
      type: type || 'vanity',
      status: 'available'
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Phone number added successfully',
      data: newPhoneNumber
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to add phone number'
    });
  }
};

// Upload phone numbers via CSV
export const uploadPhoneNumbersCsv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const results: { phoneNumber: string; type?: string }[] = [];
    const errors: { phoneNumber: string; error: string }[] = [];
    const filePath = req.file.path;

    if (!fs.existsSync(filePath)) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'File not found after upload'
      });
    }

    // Process the CSV file
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          // Expecting CSV with at least a "phoneNumber" column
          if (data.phoneNumber) {
            results.push({
              phoneNumber: data.phoneNumber,
              type: data.type || 'vanity'
            });
          } else {
            errors.push({
              phoneNumber: JSON.stringify(data),
              error: 'Invalid format: missing phoneNumber'
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    if (results.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No valid phone numbers found in CSV',
        errors
      });
    }

    // Batch process the phone numbers
    const insertedNumbers: IPhoneNumber[] = [];
    const duplicateNumbers: string[] = [];

    for (const item of results) {
      try {
        // Check if phone number already exists
        const existingNumber = await PhoneNumber.findOne({ phoneNumber: item.phoneNumber });

        if (existingNumber) {
          duplicateNumbers.push(item.phoneNumber);
          continue;
        }

        // Create new phone number
        const newPhoneNumber = await PhoneNumber.create({
          phoneNumber: item.phoneNumber,
          type: item.type || 'vanity',
          status: 'available'
        });

        insertedNumbers.push(newPhoneNumber);
      } catch (error: any) {
        errors.push({
          phoneNumber: item.phoneNumber,
          error: error.message
        });
      }
    }

    if (errors.length > 0) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to process ${errors.length} phone numbers`,
        errors
      });
    }

    if (duplicateNumbers.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `Phone number already exists for ${duplicateNumbers.length} phone numbers`,
        duplicateNumbers
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Processed ${results.length} phone numbers`,
      data: {
        inserted: insertedNumbers.length,
        duplicates: duplicateNumbers.length,
        errors: errors.length,
        insertedNumbers,
        duplicateNumbers,

      }
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to process CSV file'
    });
  }
};

// Get all phone numbers with pagination and filtering
export const getAllPhoneNumbers = async (req: Request, res: Response) => {
  try {
    const {
      status,
      type,
      search
    } = req.query;


    // Build filter criteria
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.phoneNumber = { $regex: search, $options: 'i' };
    }

    // Get total count for pagination
    const total = await PhoneNumber.countDocuments(filter);

    // Fetch phone numbers with pagination
    const phoneNumbers = await PhoneNumber.find(filter)
      .populate('user', 'name email')

    return res.status(StatusCodes.OK).json({
      success: true,
      count: phoneNumbers.length,
      total,
      data: phoneNumbers
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to fetch phone numbers'
    });
  }
};

// Get available phone numbers
export const getAvailablePhoneNumbers = async (req: Request, res: Response) => {
  try {


    // Build filter criteria
    const filter: any = { status: 'available' };


    // Get total count for pagination
    const total = await PhoneNumber.countDocuments(filter);

    // Fetch available phone numbers
    const phoneNumbers = await PhoneNumber.find(filter)
      .sort({ createdAt: -1 })

    return res.status(StatusCodes.OK).json({
      success: true,
      total,
      data: phoneNumbers
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to fetch available phone numbers'
    });
  }
};

// Get taken phone numbers (reserved, active, or suspended)
export const getTakenPhoneNumbers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter criteria for non-available numbers
    const filter: any = { status: { $ne: 'available' } };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get total count for pagination
    const total = await PhoneNumber.countDocuments(filter);

    // Fetch taken phone numbers with their users
    const phoneNumbers = await PhoneNumber.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      count: phoneNumbers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: phoneNumbers
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to fetch taken phone numbers'
    });
  }
};

// Get phone number details
export const getPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const phoneNumber = await PhoneNumber.findById(id).populate('user', 'name email');

    if (!phoneNumber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: phoneNumber
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to get phone number details'
    });
  }
};

// // Update phone number status
// export const updatePhoneNumberStatus = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { status, userId } = req.body;

//     if (!['available', 'reserved', 'active', 'suspended'].includes(status)) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         success: false,
//         message: 'Invalid status'
//       });
//     }

//     const phoneNumber = await PhoneNumber.findById(id);

//     if (!phoneNumber) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         success: false,
//         message: 'Phone number not found'
//       });
//     }

//     // Update status
//     phoneNumber.status = status;

//     // If status is available, clear user assignment
//     if (status === 'available') {
//       phoneNumber.user = null;
//       phoneNumber.reservedUntil = null;
//     }
//     // If status is reserved, set reservation parameters
//     else if (status === 'reserved' && userId) {
//       phoneNumber.user = userId;
//       phoneNumber.reservedUntil = new Date(Date.now() + 30 * 60000); // 30 minutes
//     }
//     // If status is active or suspended, clear reservation time
//     else if (['active', 'suspended'].includes(status) && userId) {
//       phoneNumber.user = userId;
//       phoneNumber.reservedUntil = null;
//     }

//     await phoneNumber.save();

//     return res.status(StatusCodes.OK).json({
//       success: true,
//       message: 'Phone number status updated successfully',
//       data: phoneNumber
//     });
//   } catch (error: any) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: error.message || 'Failed to update phone number status'
//     });
//   }
// };

// Delete phone number
export const deletePhoneNumber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const phoneNumber = await PhoneNumber.findById(id);

    if (!phoneNumber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    // Don't allow deleting phone numbers that are in use
    if (phoneNumber.status !== 'available') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete a phone number that is currently in use'
      });
    }

    await phoneNumber.deleteOne();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Phone number deleted successfully'
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to delete phone number'
    });
  }
};

// Get phone number statistics
export const getPhoneNumberStats = async (req: Request, res: Response) => {
  try {
    const stats = await PhoneNumber.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await PhoneNumber.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the statistics
    const formattedStats = {
      totalNumbers: await PhoneNumber.countDocuments(),
      statusCounts: stats.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      typeCounts: typeStats.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };

    return res.status(StatusCodes.OK).json({
      success: true,
      data: formattedStats
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to get phone number statistics'
    });
  }
};