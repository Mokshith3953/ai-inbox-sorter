import { useState } from "react";
import { EmailList } from "./EmailList";
import { EmailStats } from "./EmailStats";
import { EmailInput } from "./EmailInput";
import { CategoryFilter } from "./CategoryFilter";
import { Mail } from "lucide-react";

export type EmailCategory = "urgent" | "promotional" | "personal" | "work" | "spam";

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet?: string;
  content?: string;
  category: EmailCategory;
  confidence_score?: number;
  created_at: string;
}

export const EmailDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | "all">("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Email Classifier</h1>
              <p className="text-muted-foreground">Automatically categorize your emails with AI</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <EmailStats refreshTrigger={refreshTrigger} />

        {/* Email Input */}
        <EmailInput onEmailAdded={handleRefresh} />

        {/* Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Email List */}
        <EmailList
          selectedCategory={selectedCategory}
          refreshTrigger={refreshTrigger}
          onEmailUpdated={handleRefresh}
        />
      </div>
    </div>
  );
};
