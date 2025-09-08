import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import apiService from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⚡ LIGHTNING FAST: Stable callbacks
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // ⚡ LIGHTNING FAST: Optimized data fetching
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Single fast API call
      const response = await apiService.get('/dashboard');
      setData(response);
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
      // Minimal fallback
      setData({
        statistics: { boards: {}, tasks: {}, productivity: {} },
        recent_boards: [],
        my_tasks: [],
        recent_activity: []
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ⚡ LIGHTNING FAST: Immediate effect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ⚡ LIGHTNING FAST: Memoized stats with EXACT first version icons
  const stats = useMemo(() => {
    if (!data?.statistics) return [];
    
    const { boards, tasks, productivity } = data.statistics;
    
    return [
      { 
        title: 'Total Boards', 
        value: boards?.total || 0, 
        subtitle: `${boards?.owned || 0} owned`, 
        color: 'bg-blue-500', 
        icon: (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      },
      { 
        title: 'My Tasks', 
        value: tasks?.assigned_to_me || 0, 
        subtitle: `${tasks?.completed || 0} completed`, 
        color: 'bg-green-500', 
        icon: (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      },
      { 
        title: 'Overdue', 
        value: tasks?.overdue || 0, 
        subtitle: 'Need attention', 
        color: 'bg-red-500', 
        icon: (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      { 
        title: 'Completion Rate', 
        value: `${productivity?.completion_rate || 0}%`, 
        subtitle: 'This month', 
        color: 'bg-purple-500', 
        icon: (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      }
    ];
  }, [data?.statistics]);

  // ⚡ INSTANT RENDER: Show header immediately, even while loading
  const headerContent = (
    <header className="mb-8 h-20">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {data?.message || `Welcome back, ${user?.name}!`}
      </h1>
      <p className="text-gray-600">Here's what's happening with your projects today.</p>
    </header>
  );

  // ⚡ OPTIMIZED LOADING: Show real header + skeleton content
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onSidebarToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="flex-1 p-4 lg:p-8">
            {/* INSTANT HEADER - No skeleton needed */}
            {headerContent}
            
            {/* Fast skeleton stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fast skeleton content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border h-64">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border h-64">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onSidebarToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="flex-1 p-4 lg:p-8">
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <button 
                      onClick={fetchData}
                      className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSidebarToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Real header content */}
            {headerContent}

            {/* Statistics Cards - EXACT first version layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <RecentBoards boards={data?.recent_boards || []} onNavigate={navigate} />
              <MyTasks tasks={data?.my_tasks || []} onNavigate={navigate} />
            </div>

            {/* Recent Activity */}
            <RecentActivity activities={data?.recent_activity || []} onNavigate={navigate} />
          </div>
        </main>
      </div>
    </div>
  );
};

// ⚡ EXACT first version StatCard
const StatCard = React.memo(({ title, value, subtitle, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-lg text-white mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
));

const RecentBoards = React.memo(({ boards, onNavigate }) => (
  <div className="lg:col-span-2">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Boards</h2>
        <button 
          onClick={() => onNavigate('/boards')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all
        </button>
      </div>
      
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No boards yet"
          description="Create your first board to get started"
          actionText="Create Board"
          onAction={() => onNavigate('/boards/create')}
        />
      )}
    </div>
  </div>
));

const MyTasks = React.memo(({ tasks, onNavigate }) => (
  <div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
        <button 
          onClick={() => onNavigate('/tasks')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all
        </button>
      </div>
      
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <TaskCard key={task.id} task={task} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          title="No tasks assigned"
          description="You're all caught up!"
          size="sm"
        />
      )}
    </div>
  </div>
));

const RecentActivity = React.memo(({ activities, onNavigate }) => (
  <div className="mt-8">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <button 
          onClick={() => onNavigate('/activity')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all
        </button>
      </div>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          title="No recent activity"
          description="Activity from your boards will appear here"
        />
      )}
    </div>
  </div>
));

// EXACT first version components
const BoardCard = React.memo(({ board, onNavigate }) => (
  <div 
    onClick={() => onNavigate(`/boards/${board.id}`)}
    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium text-gray-900 truncate">{board.title}</h3>
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
        style={{ backgroundColor: board.color || '#6B7280' }}
      ></div>
    </div>
    
    {board.description && (
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{board.description}</p>
    )}
    
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{board.tasks_count || 0} tasks</span>
      <span>{board.members_count || 0} members</span>
    </div>
    
    {board.progress_percentage !== undefined && (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{board.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${board.progress_percentage}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>
));

const TaskCard = React.memo(({ task, onNavigate }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div 
      onClick={() => onNavigate(task.url)}
      className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm truncate flex-1">{task.title}</h4>
        {task.is_overdue && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate">{task.board?.title}</span>
        {task.priority && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        )}
      </div>
      
      {task.due_date && (
        <div className="mt-2 text-xs text-gray-500">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
});

const ActivityItem = React.memo(({ activity }) => (
  <div className="flex items-start space-x-3">
    <div className={`${activity.color || 'text-gray-400'} mt-1`}>
      {activity.icon || '📝'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900">{activity.description}</p>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-xs text-gray-500">{activity.user?.name}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">{activity.age}</span>
        {activity.board && (
          <>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{activity.board.title}</span>
          </>
        )}
      </div>
    </div>
  </div>
));

const EmptyState = React.memo(({ icon, title, description, actionText, onAction, size = 'md' }) => (
  <div className={`text-center ${size === 'sm' ? 'py-6' : 'py-8'}`}>
    <div className="mx-auto mb-4">
      {icon}
    </div>
    <h3 className={`${size === 'sm' ? 'text-sm' : 'text-lg'} font-medium text-gray-900 mb-2`}>
      {title}
    </h3>
    <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-500 mb-4`}>
      {description}
    </p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className={`${size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium`}
      >
        {actionText}
      </button>
    )}
  </div>
));

export default Dashboard;