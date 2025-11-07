import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { EmailCategory } from "./EmailDashboard";
import { AlertCircle, Mail, ShoppingBag, Briefcase, Heart, Ban } from "lucide-react";

interface EmailStatsProps {
  refreshTrigger: number;
}

interface CategoryStats {
  category: EmailCategory;
  count: number;
}

const categoryIcons: Record<EmailCategory, React.ReactNode> = {
  urgent: <AlertCircle className="w-5 h-5" />,
  promotional: <ShoppingBag className="w-5 h-5" />,
  personal: <Heart className="w-5 h-5" />,
  work: <Briefcase className="w-5 h-5" />,
  spam: <Ban className="w-5 h-5" />,
};

const categoryLabels: Record<EmailCategory, string> = {
  urgent: "Urgent",
  promotional: "Promotional",
  personal: "Personal",
  work: "Work",
  spam: "Spam",
};

export const EmailStats = ({ refreshTrigger }: EmailStatsProps) => {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("category");

      if (error) throw error;

      const categoryCounts = (data || []).reduce((acc, email) => {
        const category = email.category as EmailCategory;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<EmailCategory, number>);

      const statsArray: CategoryStats[] = (Object.keys(categoryLabels) as EmailCategory[]).map(
        (category) => ({
          category,
          count: categoryCounts[category] || 0,
        })
      );

      setStats(statsArray);
      setTotal(data?.length || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Card */}
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>

        {/* Category Cards */}
        {stats.map(({ category, count }) => (
          <Card key={category} className="p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${category}/10 text-${category}`}>
                {categoryIcons[category]}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{categoryLabels[category]}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
