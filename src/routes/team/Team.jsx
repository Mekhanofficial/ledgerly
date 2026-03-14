import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import TeamManagementPanel from '../../components/team/TeamManagementPanel';
import { useAccount } from '../../context/AccountContext';
import { normalizePlanId } from '../../utils/subscription';

const Team = () => {
  const { accountInfo } = useAccount();
  const subscriptionStatus = String(accountInfo?.subscriptionStatus || 'active').toLowerCase();
  const effectivePlan = subscriptionStatus === 'expired' ? 'starter' : normalizePlanId(accountInfo?.plan);
  const hasTeamFeature = ['professional', 'enterprise'].includes(effectivePlan);

  if (!hasTeamFeature) {
    return (
      <DashboardLayout>
        <div className="border rounded-xl p-8 text-center bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
          <h2 className="text-xl font-semibold">Team Is On Professional+</h2>
          <p className="mt-2 text-sm">Upgrade your plan to invite teammates and manage team roles.</p>
          <Link
            to="/payments/pricing"
            className="inline-flex mt-5 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            View Pricing
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TeamManagementPanel />
    </DashboardLayout>
  );
};

export default Team;
