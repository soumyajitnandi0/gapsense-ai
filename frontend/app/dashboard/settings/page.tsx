"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Lock, User, Monitor, KeyRound, ShieldAlert, Loader2, Github } from "lucide-react"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
    id: string
    name: string
    email: string
    picture?: string
    authProvider: string
    githubConnected: boolean
    githubUsername?: string
    createdAt: string
}

interface NotificationPrefs {
    emailNotifications: boolean
    assessmentReminders: boolean
    weeklyDigest: boolean
}

export default function SettingsPage() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("account")
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    })
    const [notifications, setNotifications] = useState<NotificationPrefs>({
        emailNotifications: true,
        assessmentReminders: true,
        weeklyDigest: false,
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [deleteConfirm, setDeleteConfirm] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings')
            setUser(res.data.user)
            setFormData({
                name: res.data.user.name,
                email: res.data.user.email,
            })
            if (res.data.profile?.preferences?.notifications) {
                setNotifications(res.data.profile.preferences.notifications)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
            toast({
                title: "Error",
                description: "Failed to load settings. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const updateAccount = async () => {
        setSaving(true)
        try {
            await api.put('/settings/account', formData)
            toast({
                title: "Success",
                description: "Account information updated successfully.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update account.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const updatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive"
            })
            return
        }

        setSaving(true)
        try {
            await api.put('/settings/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })
            toast({
                title: "Success",
                description: "Password updated successfully.",
            })
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update password.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const updateNotifications = async () => {
        setSaving(true)
        try {
            await api.put('/settings/notifications', notifications)
            toast({
                title: "Success",
                description: "Notification preferences updated.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notifications.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const deleteAccount = async () => {
        if (deleteConfirm !== user?.email) {
            toast({
                title: "Error",
                description: "Please type your email to confirm deletion.",
                variant: "destructive"
            })
            return
        }

        setSaving(true)
        try {
            await api.delete('/settings/account')
            toast({
                title: "Account Deleted",
                description: "Your account has been permanently deleted.",
            })
            window.location.href = '/'
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete account.",
                variant: "destructive"
            })
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#111]" />
            </div>
        )
    }

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500 text-[#2B2D2B]">
            {/* Header */}
            <div className="mb-10 px-2 lg:px-6">
                <h1 className="text-4xl lg:text-[48px] font-heading font-medium tracking-tight text-[#111] mb-2">Settings</h1>
                <p className="text-[16px] text-[#2B2D2B]/60 max-w-xl">
                    Manage your account preferences, profile details, and security settings.
                </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-[280px_1fr] px-2 lg:px-6">
                {/* Side Navigation for settings */}
                <nav className="flex flex-col gap-2">
                    <button 
                        onClick={() => setActiveTab('account')}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition font-medium text-[15px] ${activeTab === 'account' ? 'bg-[#111] text-white shadow-md' : 'text-[#2B2D2B]/70 hover:bg-[#1a1a1a]/[0.04] hover:text-[#111]'}`}
                    >
                        <User className="h-5 w-5" /> Account Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition font-medium text-[15px] ${activeTab === 'appearance' ? 'bg-[#111] text-white shadow-md' : 'text-[#2B2D2B]/70 hover:bg-[#1a1a1a]/[0.04] hover:text-[#111]'}`}
                    >
                        <Monitor className="h-5 w-5" /> Appearance
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition font-medium text-[15px] ${activeTab === 'notifications' ? 'bg-[#111] text-white shadow-md' : 'text-[#2B2D2B]/70 hover:bg-[#1a1a1a]/[0.04] hover:text-[#111]'}`}
                    >
                        <Bell className="h-5 w-5" /> Notifications
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition font-medium text-[15px] ${activeTab === 'security' ? 'bg-[#111] text-white shadow-md' : 'text-[#2B2D2B]/70 hover:bg-[#1a1a1a]/[0.04] hover:text-[#111]'}`}
                    >
                        <Lock className="h-5 w-5" /> Privacy & Security
                    </button>
                </nav>

                <div className="space-y-10 w-full">
                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <>
                            {/* Profile Info */}
                            <div className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border border-black/5 shadow-sm bg-white/40">
                                <div className="mb-8 border-b border-black/5 pb-6">
                                    <h2 className="text-2xl font-medium tracking-tight text-[#111] mb-2 flex items-center gap-2">
                                        <KeyRound className="h-5 w-5 text-primary" /> Profile Information
                                    </h2>
                                    <p className="text-[15px] text-[#2B2D2B]/60">
                                        Update your public display name and email address.
                                    </p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-[#111] ml-1">Display Name</Label>
                                        <Input 
                                            id="name" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="bg-white border border-black/5 shadow-sm rounded-xl h-12 px-4 text-[15px] focus-visible:ring-primary/20 text-[#111] font-medium placeholder:text-black/30" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-[#111] ml-1">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="bg-white border border-black/5 shadow-sm rounded-xl h-12 px-4 text-[15px] focus-visible:ring-primary/20 text-[#111] font-medium placeholder:text-black/30" 
                                        />
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <button 
                                            onClick={updateAccount}
                                            disabled={saving}
                                            className="px-8 py-3 bg-primary text-[#111] font-semibold rounded-full hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Connected Accounts */}
                            <div className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border border-black/5 shadow-sm bg-white/40">
                                <div className="mb-8 border-b border-black/5 pb-6">
                                    <h2 className="text-2xl font-medium tracking-tight text-[#111] mb-2 flex items-center gap-2">
                                        <Github className="h-5 w-5 text-primary" /> Connected Accounts
                                    </h2>
                                    <p className="text-[15px] text-[#2B2D2B]/60">
                                        Manage your connected social accounts.
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-[#111] flex items-center justify-center">
                                                <Github className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#111]">GitHub</p>
                                                <p className="text-sm text-[#2B2D2B]/60">
                                                    {user?.githubConnected 
                                                        ? `Connected as @${user.githubUsername}` 
                                                        : 'Not connected'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.githubConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {user?.githubConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#111]">Google</p>
                                                <p className="text-sm text-[#2B2D2B]/60">
                                                    {user?.authProvider === 'google' 
                                                        ? `Signed in with Google` 
                                                        : 'Not connected'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.authProvider === 'google' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {user?.authProvider === 'google' ? 'Connected' : 'Not used'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && user?.authProvider === 'email' && (
                        <div className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border border-black/5 shadow-sm bg-white/40">
                            <div className="mb-8 border-b border-black/5 pb-6">
                                <h2 className="text-2xl font-medium tracking-tight text-[#111] mb-2 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-primary" /> Change Password
                                </h2>
                                <p className="text-[15px] text-[#2B2D2B]/60">
                                    Update your password to keep your account secure.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-sm font-semibold text-[#111] ml-1">Current Password</Label>
                                    <Input 
                                        id="currentPassword" 
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="bg-white border border-black/5 shadow-sm rounded-xl h-12 px-4 text-[15px] focus-visible:ring-primary/20 text-[#111] font-medium placeholder:text-black/30" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-sm font-semibold text-[#111] ml-1">New Password</Label>
                                    <Input 
                                        id="newPassword" 
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="bg-white border border-black/5 shadow-sm rounded-xl h-12 px-4 text-[15px] focus-visible:ring-primary/20 text-[#111] font-medium placeholder:text-black/30" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#111] ml-1">Confirm New Password</Label>
                                    <Input 
                                        id="confirmPassword" 
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="bg-white border border-black/5 shadow-sm rounded-xl h-12 px-4 text-[15px] focus-visible:ring-primary/20 text-[#111] font-medium placeholder:text-black/30" 
                                    />
                                </div>
                                <div className="flex justify-end pt-6">
                                    <button 
                                        onClick={updatePassword}
                                        disabled={saving}
                                        className="px-8 py-3 bg-primary text-[#111] font-semibold rounded-full hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border border-black/5 shadow-sm bg-white/40">
                            <div className="mb-8 border-b border-black/5 pb-6">
                                <h2 className="text-2xl font-medium tracking-tight text-[#111] mb-2 flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-primary" /> Appearance
                                </h2>
                                <p className="text-[15px] text-[#2B2D2B]/60">
                                    Customize how the dashboard looks and feels on your device.
                                </p>
                            </div>
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-[#111] mb-4 ml-1">Color Theme</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="border-2 border-primary rounded-2xl p-4 bg-white shadow-sm cursor-pointer text-center relative overflow-hidden">
                                            <div className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary rounded-full"></div>
                                            <div className="w-full h-16 bg-[#FAF9F6] rounded-xl border border-black/5 mb-3 flex items-start p-2 gap-2">
                                                <div className="w-4 flex flex-col gap-1">
                                                    <div className="h-1.5 bg-[#111]/20 rounded-full w-full"></div>
                                                    <div className="h-1 bg-[#111]/10 rounded-full w-full"></div>
                                                </div>
                                                <div className="flex-1 h-full bg-white rounded-lg shadow-sm"></div>
                                            </div>
                                            <p className="font-semibold text-[#111] text-[13px]">Light (Quiet Luxury)</p>
                                        </div>
                                        <div className="border-2 border-transparent hover:border-black/10 rounded-2xl p-4 bg-white/50 shadow-sm cursor-not-allowed opacity-60 text-center">
                                            <div className="w-full h-16 bg-[#1a1a1a] rounded-xl border border-white/5 mb-3 flex items-start p-2 gap-2">
                                                <div className="w-4 flex flex-col gap-1">
                                                    <div className="h-1.5 bg-white/30 rounded-full w-full"></div>
                                                    <div className="h-1 bg-white/20 rounded-full w-full"></div>
                                                </div>
                                                <div className="flex-1 h-full bg-black/50 rounded-lg shadow-sm"></div>
                                            </div>
                                            <p className="font-medium text-[#2B2D2B]/60 text-[13px]">Dark (Coming Soon)</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-[#111] mb-2 ml-1">Interface Elements</h3>
                                    <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl">
                                        <div>
                                            <p className="font-semibold text-[#111]">Smooth Animations</p>
                                            <p className="text-sm text-[#2B2D2B]/60">Enable fluid transitions between dashboard views</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl">
                                        <div>
                                            <p className="font-semibold text-[#111]">Compact View</p>
                                            <p className="text-sm text-[#2B2D2B]/60">Decrease padding and margin to fit more content</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-200">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border border-black/5 shadow-sm bg-white/40">
                            <div className="mb-8 border-b border-black/5 pb-6">
                                <h2 className="text-2xl font-medium tracking-tight text-[#111] mb-2 flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" /> Notification Preferences
                                </h2>
                                <p className="text-[15px] text-[#2B2D2B]/60">
                                    Choose what notifications you want to receive.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive general updates via email' },
                                    { key: 'assessmentReminders', label: 'Assessment Reminders', desc: 'Get reminded to complete your assessments' },
                                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your progress' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl">
                                        <div>
                                            <p className="font-semibold text-[#111]">{item.label}</p>
                                            <p className="text-sm text-[#2B2D2B]/60">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof NotificationPrefs]})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[item.key as keyof NotificationPrefs] ? 'bg-primary' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[item.key as keyof NotificationPrefs] ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex justify-end pt-6">
                                    <button 
                                        onClick={updateNotifications}
                                        disabled={saving}
                                        className="px-8 py-3 bg-primary text-[#111] font-semibold rounded-full hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone - Show in security tab */}
                    {activeTab === 'security' && (
                        <div className="glass-panel p-8 lg:p-10 rounded-[2.5rem] border border-red-200 shadow-sm bg-red-50/30">
                            <div className="mb-6">
                                <h2 className="text-2xl font-medium tracking-tight text-red-600 mb-2 flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5" /> Danger Zone
                                </h2>
                                <p className="text-[15px] text-red-900/60">
                                    Irreversible actions regarding your account data and portfolio analytics.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white border border-red-100 rounded-[1.5rem] shadow-sm">
                                    <div>
                                        <h4 className="font-bold text-[#111] text-[17px] mb-1">Delete Account</h4>
                                        <p className="text-[14px] text-[#2B2D2B]/60 max-w-sm">Permanently remove all your assessment data, connected repositories, and AI analysis.</p>
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-white border border-red-100 rounded-[1.5rem] shadow-sm">
                                    <p className="text-sm text-red-600 mb-4">
                                        Type <strong>{user?.email}</strong> to confirm account deletion:
                                    </p>
                                    <Input 
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                        placeholder="Enter your email"
                                        className="bg-white border border-red-200 shadow-sm rounded-xl h-12 px-4 text-[15px] focus-visible:ring-red-200 text-[#111] mb-4"
                                    />
                                    <button 
                                        onClick={deleteAccount}
                                        disabled={saving || deleteConfirm !== user?.email}
                                        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Deleting...' : 'Permanently Delete Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
