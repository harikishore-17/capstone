import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Activity,
  UserCheck,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Zap,
  Eye,
  Shield,
  BarChart3,
  PieChart,
  LineChart,
  Sun,
  Moon
} from 'lucide-react';

const Dashboard = ({ userRole, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Mock data with more dynamic content
  const stats = [
    {
      title: 'Active Patients',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Critical Risk',
      value: '89',
      change: '-8.2%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'AI Predictions',
      value: '2,341',
      change: '+24.1%',
      trend: 'up',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Success Rate',
      value: '94.7%',
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ];

  const recentPatients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      condition: 'Heart Failure',
      riskLevel: 'Critical',
      lastVisit: '2 hours ago',
      nextFollowup: 'Today 3:00 PM',
      riskScore: 92,
      aiConfidence: 98
    },
    {
      id: 2,
      name: 'Michael Chen',
      condition: 'Diabetes Type 2',
      riskLevel: 'Moderate',
      lastVisit: '6 hours ago',
      nextFollowup: 'Tomorrow 10:00 AM',
      riskScore: 67,
      aiConfidence: 89
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      condition: 'Pneumonia',
      riskLevel: 'Low',
      lastVisit: '1 day ago',
      nextFollowup: 'Next week',
      riskScore: 23,
      aiConfidence: 95
    },
    {
      id: 4,
      name: 'Robert Kim',
      condition: 'Heart Failure',
      riskLevel: 'Critical',
      lastVisit: '30 min ago',
      nextFollowup: 'Today 5:00 PM',
      riskScore: 88,
      aiConfidence: 96
    }
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'Moderate': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'Low': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'AI Overview', icon: Brain, color: 'text-purple-500' },
    { id: 'patients', label: 'Patient Analytics', icon: Users, color: 'text-blue-500' },
    { id: 'predictions', label: 'ML Predictions', icon: TrendingUp, color: 'text-green-500' },
    { id: 'insights', label: 'Smart Insights', icon: Eye, color: 'text-indigo-500' },
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'System Control', icon: UserCheck, color: 'text-red-500' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-500">
      {/* Animated Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">HealthVision</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {userRole === 'admin' ? 'System Administrator' : 'Healthcare Professional'}
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="AI-powered search..."
                  className="pl-10 pr-4 py-3 w-80 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>
              
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
              
              <Button onClick={onLogout} variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Animated Sidebar */}
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 min-h-screen"
        >
          <nav className="p-6 space-y-3">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className={`h-6 w-6 ${activeTab === item.id ? 'text-white' : item.color}`} />
                <span className="font-semibold">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">AI-Powered Dashboard</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Real-time insights powered by machine learning</p>
                </div>

                {/* Animated Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Card className={`hover:shadow-2xl transition-all duration-300 border-0 ${stat.bgColor}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{stat.title}</p>
                              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                              <p className={`text-sm mt-2 font-semibold ${
                                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stat.change} from last period
                              </p>
                            </div>
                            <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                              <stat.icon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Patient List */}
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl gradient-text">Critical Risk Patients</CardTitle>
                        <CardDescription className="text-base">AI-identified high-priority cases requiring immediate attention</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-700/50">
                          <Filter className="h-4 w-4 mr-2" />
                          Smart Filter
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-700/50">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients.map((patient, index) => (
                        <motion.div 
                          key={patient.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{patient.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{patient.condition}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Last visit: {patient.lastVisit}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getRiskColor(patient.riskLevel)} shadow-lg`}>
                                {patient.riskLevel}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk: {patient.riskScore}%</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex items-center space-x-1">
                                <Brain className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{patient.aiConfidence}%</span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">AI Confidence</p>
                            </div>
                            
                            <Button variant="ghost" size="sm" className="group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold">
                        View All Patients
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Other tabs with placeholder content */}
            {activeTab !== 'overview' && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">
                    {sidebarItems.find(item => item.id === activeTab)?.label}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Advanced analytics and insights</p>
                </div>
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      {React.createElement(sidebarItems.find(item => item.id === activeTab)?.icon, { className: "h-12 w-12 text-white" })}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {sidebarItems.find(item => item.id === activeTab)?.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Advanced {activeTab} interface with AI-powered insights would be implemented here
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

