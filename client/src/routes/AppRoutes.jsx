import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { MainLayout } from '../layouts/MainLayout'
import { AdminRoute } from './AdminRoute'
import { DonorRoute } from './DonorRoute'
import { PrivateRoute } from './PrivateRoute'
import { VolunteerRoute } from './VolunteerRoute'

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })))
const LoginPage = lazyNamed(() => import('../pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('../pages/auth/RegisterPage'), 'RegisterPage')
const RoleDashboardHome = lazyNamed(() => import('../pages/dashboard/RoleDashboardHome'), 'RoleDashboardHome')
const AllUsersPage = lazyNamed(() => import('../pages/dashboard/admin/AllUsersPage'), 'AllUsersPage')
const CreateDonationRequestPage = lazyNamed(() => import('../pages/dashboard/donor/CreateDonationRequestPage'), 'CreateDonationRequestPage')
const EditDonationRequestPage = lazyNamed(() => import('../pages/dashboard/donor/EditDonationRequestPage'), 'EditDonationRequestPage')
const MyDonationRequestsPage = lazyNamed(() => import('../pages/dashboard/donor/MyDonationRequestsPage'), 'MyDonationRequestsPage')
const AllDonationRequestsPage = lazyNamed(() => import('../pages/dashboard/volunteer/AllDonationRequestsPage'), 'AllDonationRequestsPage')
const DonationRequestsPage = lazyNamed(() => import('../pages/public/DonationRequestsPage'), 'DonationRequestsPage')
const HomePage = lazyNamed(() => import('../pages/public/HomePage'), 'HomePage')
const NotFoundPage = lazyNamed(() => import('../pages/public/NotFoundPage'), 'NotFoundPage')
const SearchDonorsPage = lazyNamed(() => import('../pages/public/SearchDonorsPage'), 'SearchDonorsPage')
const DonationDetailsPage = lazyNamed(() => import('../pages/shared/DonationDetailsPage'), 'DonationDetailsPage')
const FundingPage = lazyNamed(() => import('../pages/shared/FundingPage'), 'FundingPage')
const ProfilePage = lazyNamed(() => import('../pages/shared/ProfilePage'), 'ProfilePage')

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage label="Loading page…" />}>
      <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="donation-requests" element={<DonationRequestsPage />} />
        <Route path="search" element={<SearchDonorsPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="donation-requests/:id" element={<DonationDetailsPage />} />
          <Route path="funding" element={<FundingPage />} />
          <Route path="funding/success" element={<FundingPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<RoleDashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route element={<DonorRoute />}>
            <Route path="my-donation-requests" element={<MyDonationRequestsPage />} />
            <Route path="create-donation-request" element={<CreateDonationRequestPage />} />
            <Route path="edit-donation-request/:id" element={<EditDonationRequestPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="all-users" element={<AllUsersPage />} />
          </Route>
          <Route element={<VolunteerRoute />}>
            <Route path="all-blood-donation-request" element={<AllDonationRequestsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      </Routes>
    </Suspense>
  )
}
