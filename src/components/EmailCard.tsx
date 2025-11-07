import { Email, EmailCategory } from "./EmailDashboard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailCardProps {
  email: Email;
  onCategoryChange: (emailId: string, category: EmailCategory) => void;
  onDelete: (emailId: string) => void;
}

const categoryConfig: Record<
  EmailCategory,
  { label: string; className: string }
> = {
  urgent: { label: "Urgent", className: "bg-urgent text-urgent-foreground" },
  promotional: { label: "Promotional", className: "bg-promotional text-promotional-foreground" },
  personal: { label: "Personal", className: "bg-personal text-personal-foreground" },
  work: { label: "Work", className: "bg-work text-work-foreground" },
  spam: { label: "Spam", className: "bg-spam text-spam-foreground" },
};

export const EmailCard = ({ email, onCategoryChange, onDelete }: EmailCardProps) => {
  const categoryInfo = categoryConfig[email.category];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("font-semibold", categoryInfo.className)}>
              {categoryInfo.label}
            </Badge>
            {email.confidence_score && (
              <span className="text-xs text-muted-foreground">
                {Math.round(email.confidence_score * 100)}% confidence
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">From: {email.sender}</p>
            <h3 className="font-semibold text-foreground truncate">{email.subject}</h3>
            {email.snippet && (
              <p className="text-sm text-muted-foreground line-clamp-2">{email.snippet}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Change Category
            </div>
            {(Object.keys(categoryConfig) as EmailCategory[]).map((cat) => (
              <DropdownMenuItem
                key={cat}
                onClick={() => onCategoryChange(email.id, cat)}
                className="flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                {categoryConfig[cat].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => onDelete(email.id)}
              className="flex items-center gap-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
