import { createBrowserRouter } from 'react-router';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import BuildingsPage from './pages/BuildingsPage';
import MachinesPage from './pages/MachinesPage';
import SchedulesPage from './pages/SchedulesPage';
import StatisticsPage from './pages/StatisticsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: 'dashboard',
        Component: DashboardPage,
      },
      {
        path: 'buildings',
        Component: BuildingsPage,
      },
      {
        path: 'machines',
        Component: MachinesPage,
      },
      {
        path: 'schedules',
        Component: SchedulesPage,
      },
      {
        path: 'statistics',
        Component: StatisticsPage,
      },
      {
        path: 'activity-logs',
        Component: ActivityLogsPage,
      },
    ],
  },
]);
