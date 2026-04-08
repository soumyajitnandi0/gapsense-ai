"use client"

import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and resume.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resume Upload</CardTitle>
                        <CardDescription>
                            Upload your latest resume (PDF/DOCX) to update your readiness score.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 5MB)</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input id="bio" placeholder="Full Stack Developer..." />
                        </div>
                        <div className="flex justify-end">
                            <Button>Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
