import { motion } from "framer-motion";
import {
  LogOut,
  Database,
  Code,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import Button from "./Button";

const Dashboard = ({ user, setUser }) => {
  const handleLogout = () => {
    setUser(null);
  };

  const adminFeatures = [
    {
      icon: Database,
      title: "Database Management",
      desc: "Manage database connections and queries",
    },
    {
      icon: Users,
      title: "User Management",
      desc: "Control user access and permissions",
    },
    {
      icon: Settings,
      title: "System Settings",
      desc: "Configure system parameters",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "View system performance metrics",
    },
  ];

  const devFeatures = [
    {
      icon: Code,
      title: "Code Repository",
      desc: "Access and manage code repositories",
    },
    {
      icon: Settings,
      title: "Development Tools",
      desc: "IDE and debugging tools",
    },
    {
      icon: BarChart3,
      title: "Performance Monitor",
      desc: "Application performance insights",
    },
    {
      icon: Database,
      title: "API Testing",
      desc: "Test and debug API endpoints",
    },
  ];

  const features = user.role === "admin" ? adminFeatures : devFeatures;
  const bgColor = user.role === "admin" ? "bg-blue-600" : "bg-green-600";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={`${bgColor} text-white p-4`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {user.role === "admin" ? (
              <Database className="w-8 h-8" />
            ) : (
              <Code className="w-8 h-8" />
            )}
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm opacity-90">
                {user.role === "admin"
                  ? "Database Administrator"
                  : "Software Developer"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}!
          </h2>
          <p className="text-gray-600">Here's your personalized dashboard</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className={`w-2 h-2 ${bgColor} rounded-full`}></div>
                <span className="text-gray-700">
                  {user.role === "admin"
                    ? "Database backup completed"
                    : "Code deployment successful"}{" "}
                  - 2 hours ago
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
