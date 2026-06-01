'use client';

import { useEffect, useState } from 'react';

interface CreatorReferralRow {
  creatorUserId: string;
  username: string;
  displayName: string;
  referralCode: string;
  totalReferred: number;
  lastReferralAt: string | null;
}

interface ReferredUser {
  username: string;
  email: string;
  avatar: string | null;
  joinedAt: string;
  role: string;
}

interface DrillDownPanelProps {
  creator: CreatorReferralRow;
  onClose: () => void;
}

function DrillDownPanel({ creator, onClose }: DrillDownPanelProps) {
  const [users, setUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/referrals/${creator.creatorUserId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load users');
        return r.json();
      })
      .then((data) => setUsers(data.users ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [creator.creatorUserId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {creator.displayName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              @{creator.username} &middot; Code:{' '}
              <code className="font-mono text-gray-700">{creator.referralCode}</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center gap-6">
          <div>
            <p className="text-xs text-green-700">Total Referred</p>
            <p className="text-2xl font-bold text-green-800">{creator.totalReferred}</p>
          </div>
          <div>
            <p className="text-xs text-green-700">Last Referral</p>
            <p className="text-sm font-medium text-green-800">
              {creator.lastReferralAt
                ? new Date(creator.lastReferralAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-600 text-sm">{error}</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-400 text-sm">No users have signed up using this referral link yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((u, i) => (
                <li key={`${u.username}-${i}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 overflow-hidden">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {u.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">@{u.username}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      {new Date(u.joinedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full capitalize">
                      {u.role}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default function ReferralAnalytics() {
  const [rows, setRows] = useState<CreatorReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CreatorReferralRow | null>(null);

  useEffect(() => {
    fetch('/api/admin/referrals')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load referral data');
        return r.json();
      })
      .then((data) => setRows(data.referrals ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalReferrals = rows.reduce((sum, r) => sum + r.totalReferred, 0);
  const activeReferrers = rows.filter((r) => r.totalReferred > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Creators</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{rows.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Active Referrers</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{activeReferrers}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Users Referred</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{totalReferrals}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Creator Referral Leaderboard</h3>
            <p className="text-sm text-gray-500 mt-1">
              Click any row to see all users who joined via that creator&apos;s link
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users Referred</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Referral</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                      No referral data yet
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.creatorUserId}
                      onClick={() => setSelected(row)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{row.displayName}</div>
                        <div className="text-sm text-gray-500">@{row.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                          {row.referralCode}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                            row.totalReferred > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {row.totalReferred}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {row.lastReferralAt
                          ? new Date(row.lastReferralAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-blue-600 text-sm font-medium">View →</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drill-down panel */}
      {selected && (
        <DrillDownPanel creator={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
