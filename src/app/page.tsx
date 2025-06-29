import { BusinessRulesSection } from "@/components/BusinessRulesSection";
import { DataGridSection } from "@/components/DataGridSection";
import { FileUploadSection } from "@/components/FileUploadSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ValidationSection } from "@/components/ValidationSection";
import { Database, Settings, Shield, Sparkles } from "lucide-react";

export default function Home() {
  return (
   <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Data Alchemist</h1>
                <p className="text-sm text-muted-foreground">AI-powered data transformation workbench</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              v1.0 Beta
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Upload</p>
                  <p className="text-xs text-muted-foreground">CSV/XLSX Files</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Validate</p>
                  <p className="text-xs text-muted-foreground">Data Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Configure</p>
                  <p className="text-xs text-muted-foreground">Business Rules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Export</p>
                  <p className="text-xs text-muted-foreground">Clean Data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* File Upload Section */}
        <FileUploadSection />

        <Separator />

        {/* Data Grid Section */}
        <DataGridSection />

        <Separator />

        {/* Validation Section */}
        <ValidationSection />

        <Separator />

        {/* Business Rules Section */}
        <BusinessRulesSection />
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 Data Alchemist. Transform your data with AI precision.</p>
            <div className="flex items-center gap-4">
              <span>Built with React & TypeScript</span>
              <Badge variant="outline">AI-Powered</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
