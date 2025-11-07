-- Create emails table with classifications
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  snippet TEXT,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('urgent', 'promotional', 'personal', 'work', 'spam')),
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster category filtering
CREATE INDEX idx_emails_category ON public.emails(category);
CREATE INDEX idx_emails_created_at ON public.emails(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_emails_updated_at
BEFORE UPDATE ON public.emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app without user auth)
CREATE POLICY "Anyone can view emails"
ON public.emails
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert emails"
ON public.emails
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update emails"
ON public.emails
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete emails"
ON public.emails
FOR DELETE
USING (true);