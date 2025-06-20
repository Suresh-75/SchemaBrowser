import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Database, Code } from "lucide-react";
import Button from "./Button";
import { useNavigate } from "react-router";
const Login = ({ setUser }) => {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  const mockUsers = {
    admin: {
      username: "admin",
      password: "admin",
      name: "Database Admin",
    },
    developer: {
      username: "dev",
      password: "dev",
      name: "Developer",
    },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const mockUser = mockUsers[role];
    if (username === mockUser.username && password === mockUser.password) {
      console.log(`Logged in as ${mockUser.name} (${role})`);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div
      className={`absolute inset-0 -z-10 h-full w-full bg-white  ${
        role === "admin"
          ? "[background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#2563eb_100%)]"
          : "[background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"
      }`}
    >
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Login</p>
            </div>

            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  role === "admin"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Database className="w-4 h-4 mr-2" />
                Admin
              </button>
              <button
                onClick={() => setRole("developer")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  role === "developer"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Code className="w-4 h-4 mr-2" />
                Developer
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Enter ${role} usernmae`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className={`w-full ${
                  role === "admin"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                Sign In as {role === "admin" ? "Admin" : "Developer"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo Credentials:</p>
              <p>Admin: admin / admin</p>
              <p>Developer: dev / dev</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
