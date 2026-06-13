import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">NextjsCMS</h1>
        <p className="text-gray-600 mb-8">Visual Page Builder for your clients</p>
        <div className="flex flex-col gap-3">
          <Link href="/admin" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Tenant Admin →
          </Link>
          <Link href="/superadmin" className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900">
            Super Admin →
          </Link>
        </div>
      </div>
    </div>
  );
}
