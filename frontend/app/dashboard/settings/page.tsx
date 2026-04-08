"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, User, Eye, Monitor } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h3 className="text-2xl font-bold font-heading">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your preferences, account settings, and notification choices.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <div className="grid gap-6 md:grid-cols-[250px_1fr]">
                {/* Side Navigation for settings */}
                <nav className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start bg-white/10 text-white hover:bg-white/20">
                        <User className="mr-2 h-4 w-4" /> Account
                    </Button>
                    <Button variant="ghost" className="justify-start text-muted-foreground hover:bg-white/5 hover:text-white">
                        <Monitor className="mr-2 h-4 w-4" /> Appearance
                    </Button>
                    <Button variant="ghost" className="justify-start text-muted-foreground hover:bg-white/5 hover:text-white">
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                    <Button variant="ghost" className="justify-start text-muted-foreground hover:bg-white/5 hover:text-white">
                        <Lock className="mr-2 h-4 w-4" /> Privacy & Security
                    </Button>
                </nav>

                <div className="space-y-6">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your public profile and email address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" defaultValue="Soumyajit Nandi" className="bg-black/50 border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue="user@example.com" className="bg-black/50 border-white/10 text-white" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions regarding your account data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-white">Delete Account</h4>
                                    <p className="text-sm text-muted-foreground">Permanently remove all your data and analysis.</p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
