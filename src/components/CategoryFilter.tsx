import { Button } from "./ui/button";
import { EmailCategory } from "./EmailDashboard";
import { AlertCircle, Mail, ShoppingBag, Briefcase, Heart, Ban } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: EmailCategory | "all";
  onCategoryChange: (category: EmailCategory | "all") => void;
}

const categories: Array<{ value: EmailCategory | "all"; label: string; icon: React.ReactNode }> = [
  { value: "all", label: "All", icon: <Mail className="w-4 h-4" /> },
  { value: "urgent", label: "Urgent", icon: <AlertCircle className="w-4 h-4" /> },
  { value: "promotional", label: "Promotional", icon: <ShoppingBag className="w-4 h-4" /> },
  { value: "personal", label: "Personal", icon: <Heart className="w-4 h-4" /> },
  { value: "work", label: "Work", icon: <Briefcase className="w-4 h-4" /> },
  { value: "spam", label: "Spam", icon: <Ban className="w-4 h-4" /> },
];

export const CategoryFilter = ({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(({ value, label, icon }) => (
          <Button
            key={value}
            variant={selectedCategory === value ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(value)}
            className="flex items-center gap-2"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
