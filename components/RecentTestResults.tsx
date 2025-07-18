
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function RecentTestResults({ tests }) {
  if (!tests || tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No test results yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Your recent test results will appear here once available.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800"
        >
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{test.testName}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</div>
            <div className="text-xs text-gray-400">{test.date}</div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-300">{test.score}%</span>
            <Link
              href={`/student/tests/${test.id}`}
              className="mt-2 px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 