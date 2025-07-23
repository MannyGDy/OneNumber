'use client';

// import UserDetailsForm from './UserDetailsForm';
import UserDashboardHome from './DashboardContent';



export default function Dashboard() {
  // const [isMobile, setIsMobile] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // const [userData, setUserData] = useState<UserData>({
  //   id: '07001235501',
  //   firstName: '',
  //   lastName: '',
  //   email: '',
  //   phone: '',
  //   address: '',
  //   isActive: true
  // });

  // useEffect(() => {
  //   const checkMobile = () => setIsMobile(window.innerWidth < 768);
  //   checkMobile();
  //   window.addEventListener('resize', checkMobile);
  //   return () => window.removeEventListener('resize', checkMobile);
  // }, []);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setUserData({ ...userData, [e.target.name]: e.target.value });
  // };

  // const handleToggleActive = () => {
  //   setUserData({ ...userData, isActive: !userData.isActive });
  // };

  // const handleUpdate = () => {
  //   console.log('Updating user data:', userData);
  //   alert('User details updated successfully!');
  // };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="mx-auto">

        <UserDashboardHome />
      </main>
    </div>

  );
}  