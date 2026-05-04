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
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update account.",
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
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to update password.",
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
            // Clear ALL client-side state
            localStorage.removeItem('token')
            localStorage.clear()
            toast({
                title: "Account Deleted",
                description: "Your account and all data have been permanently deleted.",
            })
            // Hard redirect to landing page
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
        <div className="w-full pb-20 animate-in fade-in duration-500 text-black">
            {/* Header */}
            <div className="mb-10 px-2 lg:px-6">
                <h1 className="text-4xl lg:text-[48px] font-black uppercase tracking-tighter text-black mb-2">Settings</h1>
                <p className="text-[16px] text-black font-bold uppercase tracking-widest max-w-xl">
                    Manage your account preferences, profile details, and security settings.
                </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-[280px_1fr] px-2 lg:px-6">
                {/* Side Navigation for settings */}
                <nav className="flex flex-col gap-4">
                    <button 
                        onClick={() => setActiveTab('account')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-none transition-all font-black uppercase tracking-widest text-[15px] border-4 border-black ${activeTab === 'account' ? 'bg-primary text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
                    >
                        <User className="h-5 w-5" /> Account Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-none transition-all font-black uppercase tracking-widest text-[15px] border-4 border-black ${activeTab === 'appearance' ? 'bg-primary text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
                    >
                        <Monitor className="h-5 w-5" /> Appearance
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-none transition-all font-black uppercase tracking-widest text-[15px] border-4 border-black ${activeTab === 'notifications' ? 'bg-primary text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
                    >
                        <Bell className="h-5 w-5" /> Notifications
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-none transition-all font-black uppercase tracking-widest text-[15px] border-4 border-black ${activeTab === 'security' ? 'bg-primary text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
                    >
                        <Lock className="h-5 w-5" /> Privacy & Security
                    </button>
                </nav>

                <div className="space-y-10 w-full">
                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <>
                            {/* Profile Info */}
                            <div className="bg-white p-8 lg:p-10 rounded-none border-4 border-black shadow-hard">
                                <div className="mb-8 border-b-4 border-black pb-6">
                                    <h2 className="text-2xl font-black tracking-widest uppercase text-black mb-2 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                            <KeyRound className="h-5 w-5 text-black" />
                                        </div> Profile Information
                                    </h2>
                                    <p className="text-[15px] font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                                        Update your public display name and email address.
                                    </p>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-black ml-1">Display Name</Label>
                                        <Input 
                                            id="name" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none h-14 px-4 text-[15px] focus-visible:ring-0 text-black font-bold placeholder:text-black/30" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-sm font-black uppercase tracking-widest text-black ml-1">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none h-14 px-4 text-[15px] focus-visible:ring-0 text-black font-bold placeholder:text-black/30" 
                                        />
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <button 
                                            onClick={updateAccount}
                                            disabled={saving}
                                            className="px-10 py-4 bg-primary text-black border-4 border-black font-black uppercase tracking-widest rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center gap-3"
                                        >
                                            {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Connected Accounts */}
                            <div className="bg-white p-8 lg:p-10 rounded-none border-4 border-black shadow-hard mt-10">
                                <div className="mb-8 border-b-4 border-black pb-6">
                                    <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-2 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                            <Github className="h-5 w-5 text-black" />
                                        </div> Connected Accounts
                                    </h2>
                                    <p className="text-[15px] font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                                        Manage your connected social accounts.
                                    </p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 border-4 border-black bg-black flex items-center justify-center">
                                                <Github className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-widest text-black">GitHub</p>
                                                <p className="text-sm font-bold uppercase text-black">
                                                    {user?.githubConnected 
                                                        ? `Connected as @${user.githubUsername}` 
                                                        : 'Not connected'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-widest ${user?.githubConnected ? 'bg-primary text-black' : 'bg-accent text-black'}`}>
                                            {user?.githubConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 border-4 border-black bg-blue-300 flex items-center justify-center">
                                                <svg className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-widest text-black">Google</p>
                                                <p className="text-sm font-bold uppercase text-black">
                                                    {user?.authProvider === 'google' 
                                                        ? `Signed in with Google` 
                                                        : 'Not connected'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-widest ${user?.authProvider === 'google' ? 'bg-primary text-black' : 'bg-accent text-black'}`}>
                                            {user?.authProvider === 'google' ? 'Connected' : 'Not used'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && user?.authProvider === 'email' && (
                        <div className="bg-white p-8 lg:p-10 rounded-none border-4 border-black shadow-hard">
                            <div className="mb-8 border-b-4 border-black pb-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-2 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <Lock className="h-5 w-5 text-black" />
                                    </div> Change Password
                                </h2>
                                <p className="text-[15px] font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                                    Update your password to keep your account secure.
                                </p>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="currentPassword" className="text-sm font-black uppercase tracking-widest text-black ml-1">Current Password</Label>
                                    <Input 
                                        id="currentPassword" 
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none h-14 px-4 text-[15px] focus-visible:ring-0 text-black font-bold placeholder:text-black/30" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="newPassword" className="text-sm font-black uppercase tracking-widest text-black ml-1">New Password</Label>
                                    <Input 
                                        id="newPassword" 
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none h-14 px-4 text-[15px] focus-visible:ring-0 text-black font-bold placeholder:text-black/30" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" className="text-sm font-black uppercase tracking-widest text-black ml-1">Confirm New Password</Label>
                                    <Input 
                                        id="confirmPassword" 
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none h-14 px-4 text-[15px] focus-visible:ring-0 text-black font-bold placeholder:text-black/30" 
                                    />
                                </div>
                                <div className="flex justify-end pt-6">
                                    <button 
                                        onClick={updatePassword}
                                        disabled={saving}
                                        className="px-10 py-4 bg-primary border-4 border-black text-black font-black uppercase tracking-widest rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="bg-white p-8 lg:p-10 rounded-none border-4 border-black shadow-hard">
                            <div className="mb-8 border-b-4 border-black pb-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-2 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <Monitor className="h-5 w-5 text-black" />
                                    </div> Appearance
                                </h2>
                                <p className="text-[15px] font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                                    Customize how the dashboard looks and feels on your device.
                                </p>
                            </div>
                            
                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4 ml-1">Color Theme</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        <div className="border-4 border-black rounded-none p-4 bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer text-center relative overflow-hidden">
                                            <div className="absolute top-2 right-2 h-3 w-3 bg-primary border-2 border-black rounded-none"></div>
                                            <div className="w-full h-16 bg-accent border-4 border-black mb-3 flex items-start p-2 gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <div className="w-4 flex flex-col gap-1">
                                                    <div className="h-1.5 bg-black rounded-none w-full"></div>
                                                    <div className="h-1 bg-black/60 rounded-none w-full"></div>
                                                </div>
                                                <div className="flex-1 h-full bg-white border-2 border-black rounded-none"></div>
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-black text-[13px]">Brutalist</p>
                                        </div>
                                        <div className="border-4 border-black border-dashed rounded-none p-4 bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-not-allowed opacity-50 text-center relative overflow-hidden">
                                            <div className="w-full h-16 bg-black border-4 border-black mb-3 flex items-start p-2 gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <div className="w-4 flex flex-col gap-1">
                                                    <div className="h-1.5 bg-white rounded-none w-full"></div>
                                                    <div className="h-1 bg-white/60 rounded-none w-full"></div>
                                                </div>
                                                <div className="flex-1 h-full bg-black border-2 border-white rounded-none"></div>
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-black text-[13px]">Dark Mode</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4 ml-1">Interface Elements</h3>
                                    <div className="flex items-center justify-between p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-black">Smooth Animations</p>
                                            <p className="text-sm font-bold uppercase text-black">Enable fluid transitions between dashboard views</p>
                                        </div>
                                        <button className="relative inline-flex h-8 w-14 items-center rounded-none border-4 border-black transition-colors bg-primary">
                                            <span className="inline-block h-5 w-5 transform rounded-none border-2 border-black bg-white transition-transform translate-x-7 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-black">Compact View</p>
                                            <p className="text-sm font-bold uppercase text-black">Decrease padding and margin to fit more content</p>
                                        </div>
                                        <button className="relative inline-flex h-8 w-14 items-center rounded-none border-4 border-black transition-colors bg-white">
                                            <span className="inline-block h-5 w-5 transform rounded-none border-2 border-black bg-white transition-transform translate-x-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white p-8 lg:p-10 rounded-none border-4 border-black shadow-hard">
                            <div className="mb-8 border-b-4 border-black pb-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-2 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <Bell className="h-5 w-5 text-black" />
                                    </div> Notification Preferences
                                </h2>
                                <p className="text-[15px] font-bold uppercase text-black ml-13 bg-accent px-2 border-2 border-black w-fit">
                                    Choose what notifications you want to receive.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive general updates via email' },
                                    { key: 'assessmentReminders', label: 'Assessment Reminders', desc: 'Get reminded to complete your assessments' },
                                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your progress' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-black">{item.label}</p>
                                            <p className="text-sm font-bold uppercase text-black/80">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof NotificationPrefs]})}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-none border-4 border-black transition-colors ${notifications[item.key as keyof NotificationPrefs] ? 'bg-primary' : 'bg-white'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-none border-2 border-black bg-white transition-transform shadow-[2px_2px_0px_rgba(0,0,0,1)] ${notifications[item.key as keyof NotificationPrefs] ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex justify-end pt-6">
                                    <button 
                                        onClick={updateNotifications}
                                        disabled={saving}
                                        className="px-10 py-4 bg-primary border-4 border-black text-black font-black uppercase tracking-widest rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone - Show in security tab */}
                    {activeTab === 'security' && (
                        <div className="bg-red-400 p-8 lg:p-10 rounded-none border-4 border-black shadow-hard mt-10">
                            <div className="mb-8 border-b-4 border-black pb-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-2 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-black border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <ShieldAlert className="h-5 w-5 text-red-400" />
                                    </div> Danger Zone
                                </h2>
                                <p className="text-[15px] font-bold uppercase text-black ml-13 bg-white px-2 border-2 border-black w-fit">
                                    Irreversible actions regarding your account data and portfolio analytics.
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-black text-xl mb-2">Delete Account</h4>
                                        <p className="text-[14px] font-bold uppercase text-black/80 max-w-sm leading-relaxed">Permanently remove all your assessment data, connected repositories, and AI analysis.</p>
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-white border-4 border-black rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] mt-4">
                                    <p className="text-sm font-black uppercase tracking-widest text-red-600 mb-4 bg-red-100 px-2 py-1 border-2 border-red-600 w-fit">
                                        Type <strong>{user?.email}</strong> to confirm account deletion:
                                    </p>
                                    <Input 
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                        placeholder="Enter your email"
                                        className="bg-white border-4 border-red-600 shadow-[4px_4px_0px_rgba(220,38,38,1)] rounded-none h-14 px-4 text-[15px] focus-visible:ring-0 text-black mb-6 font-bold"
                                    />
                                    <button 
                                        onClick={deleteAccount}
                                        disabled={saving || deleteConfirm !== user?.email}
                                        className="w-full px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest border-4 border-black rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex justify-center"
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
