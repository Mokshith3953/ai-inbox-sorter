import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Sparkles } from "lucide-react";

interface EmailInputProps {
  onEmailAdded: () => void;
}

export const EmailInput = ({ onEmailAdded }: EmailInputProps) => {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sender || !subject) {
      toast({
        title: "Error",
        description: "Please fill in sender and subject fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call the classify-email edge function
      const { data: classificationData, error: classifyError } = await supabase.functions.invoke(
        "classify-email",
        {
          body: {
            sender,
            subject,
            snippet: content.substring(0, 150),
            content,
          },
        }
      );

      if (classifyError) throw classifyError;

      // Insert the email with classification
      const { error: insertError } = await supabase.from("emails").insert({
        sender,
        subject,
        snippet: content.substring(0, 150),
        content,
        category: classificationData.category,
        confidence_score: classificationData.confidence,
      });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: `Email classified as ${classificationData.category} with ${Math.round(
          classificationData.confidence * 100
        )}% confidence`,
      });

      // Reset form
      setSender("");
      setSubject("");
      setContent("");
      onEmailAdded();
    } catch (error) {
      console.error("Error adding email:", error);
      toast({
        title: "Error",
        description: "Failed to classify and add email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Add New Email</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sender" className="text-sm font-medium text-foreground mb-1.5 block">
              From (Sender)
            </label>
            <Input
              id="sender"
              placeholder="sender@example.com"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="text-sm font-medium text-foreground mb-1.5 block">
              Subject
            </label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="text-sm font-medium text-foreground mb-1.5 block">
            Content (Optional)
          </label>
          <Textarea
            id="content"
            placeholder="Email content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Classifying...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Classify Email with AI
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
