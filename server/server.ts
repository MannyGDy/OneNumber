import { app } from "./app";
import { connectDB } from "./config/db";
import { PORT } from "./config/env";



app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is connected with port ${PORT}`);
  connectDB();
});
