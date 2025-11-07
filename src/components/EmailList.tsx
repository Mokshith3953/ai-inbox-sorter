import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Email, EmailCategory } from "./EmailDashboard";
import { EmailCard } from "./EmailCard";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailListProps {
  selectedCategory: EmailCategory | "all";
  refreshTrigger: number;
  onEmailUpdated: () => void;
}

export const EmailList = ({
  selectedCategory,
  refreshTrigger,
  onEmailUpdated,
}: EmailListProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, [selectedCategory, refreshTrigger]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails((data || []) as Email[]);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (emailId: string, newCategory: EmailCategory) => {
    try {
      const { error } = await supabase
        .from("emails")
        .update({ category: newCategory })
        .eq("id", emailId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email category updated successfully",
      });

      onEmailUpdated();
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: "Failed to update email category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (emailId: string) => {
    try {
      const { error } = await supabase.from("emails").delete().eq("id", emailId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email deleted successfully",
      });

      onEmailUpdated();
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {selectedCategory === "all"
            ? "No emails yet. Add some emails to get started!"
            : `No ${selectedCategory} emails found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          onCategoryChange={handleCategoryChange}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
