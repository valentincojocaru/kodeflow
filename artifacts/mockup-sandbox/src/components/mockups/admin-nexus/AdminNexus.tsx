import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Users,
  LogOut,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Activity
} from "lucide-react";

export default function AdminNexus() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-gradient-to-b from-[#0f172a] to-[#111827] text-white flex flex-col border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f97316] to-[#fb923c] flex items-center justify-center font-bold text-white shadow-lg">
            pK
          </div>
          <span className="text-xl font-bold tracking-tight">pyKode</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#f97316] text-white font-medium shadow-sm"
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
          >
            <FolderKanban className="w-5 h-5" />
            Projects
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
          >
            <Receipt className="w-5 h-5" />
            Invoices
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
          >
            <Users className="w-5 h-5" />
            Clients
          </a>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium border border-slate-600">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@pykode.com</p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Good morning, Admin 👋</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium shadow-sm transition-all active:scale-95">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Clients", value: "142", trend: "+12% from last month", up: true, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Active Projects", value: "24", trend: "+4% from last month", up: true, icon: FolderKanban, color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Total Invoiced", value: "$42,500", trend: "+18% from last month", up: true, icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Outstanding", value: "$12,400", trend: "-2% from last month", up: false, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium mb-3">{stat.label}</p>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-emerald-600" : "text-rose-600"}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Details Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider relative z-10">Total Invoiced (YTD)</p>
            <p className="text-4xl font-bold text-slate-900 relative z-10">$142,500</p>
          </div>
          <div className="col-span-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider relative z-10">Total Collected</p>
            <p className="text-4xl font-bold text-emerald-600 relative z-10">$130,100</p>
          </div>
          <div className="col-span-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider relative z-10">Total Outstanding</p>
            <p className="text-4xl font-bold text-rose-600 relative z-10">$12,400</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Projects Table */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Projects</h2>
              <button className="text-sm font-medium text-[#f97316] hover:text-[#ea580c]">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "E-commerce Redesign", client: "Acme Corp", status: "In Progress", statusColor: "text-emerald-700 bg-emerald-100", progress: 65 },
                    { name: "Mobile App MVP", client: "TechStart", status: "Review", statusColor: "text-purple-700 bg-purple-100", progress: 90 },
                    { name: "Brand Identity", client: "Studio XYZ", status: "Pending", statusColor: "text-amber-700 bg-amber-100", progress: 10 },
                    { name: "Marketing Site", client: "GlobalNet", status: "Completed", statusColor: "text-blue-700 bg-blue-100", progress: 100 },
                    { name: "Dashboard UI", client: "DataFlow", status: "In Progress", statusColor: "text-emerald-700 bg-emerald-100", progress: 45 },
                  ].map((project, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{project.name}</td>
                      <td className="px-6 py-4 text-slate-500">{project.client}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${project.statusColor}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px]">
                            <div className="bg-[#f97316] h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-500 w-8">{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <div className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {[
                  { text: "Invoice #INV-2023-042 paid by Acme Corp", time: "2 hours ago", type: "success" },
                  { text: "New project 'Mobile App MVP' created", time: "5 hours ago", type: "info" },
                  { text: "Client feedback received on Brand Identity", time: "Yesterday", type: "warning" },
                  { text: "System update completed", time: "Yesterday", type: "default" },
                ].map((item, i) => (
                  <div key={i} className="relative flex items-start justify-between">
                    <div className="flex items-start gap-4 w-full">
                      <div className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white border-2 shrink-0 ${
                        item.type === 'success' ? 'border-emerald-500' :
                        item.type === 'info' ? 'border-blue-500' :
                        item.type === 'warning' ? 'border-amber-500' : 'border-slate-300'
                      }`}>
                        {item.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> :
                         item.type === 'warning' ? <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> :
                         <div className={`w-2 h-2 rounded-full ${item.type === 'info' ? 'bg-blue-500' : 'bg-slate-300'}`} />}
                      </div>
                      <div className="pt-1 flex-1">
                        <p className="text-sm font-medium text-slate-800">{item.text}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 w-full text-center">View all activity</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
