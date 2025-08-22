import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { insertIdeaSchema, type InsertIdea } from "@shared/schema";
import { z } from "zod";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "science", label: "Science" },
  { value: "art", label: "Art" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
] as const;

export default function SubmissionModal({ isOpen, onClose }: SubmissionModalProps) {
  const [formData, setFormData] = useState<InsertIdea>({
    text: "",
    category: "technology",
    isAnonymous: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: InsertIdea) => {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${response.status}: ${errorData.message}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      toast({
        title: "Idea submitted!",
        description: "Your wild idea is now live for the community to rate.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit your idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      text: "",
      category: "technology",
      isAnonymous: false,
    });
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = insertIdeaSchema.parse(formData);
      setErrors({});
      submitMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleTextChange = (value: string) => {
    setFormData(prev => ({ ...prev, text: value }));
    if (errors.text) {
      setErrors(prev => ({ ...prev, text: "" }));
    }
  };

  const characterCount = formData.text.length;
  const isOverLimit = characterCount > 1000;
  const isUnderMinimum = characterCount < 10;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto" data-testid="submission-modal">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            🦇 SHARE YOUR WILD IDEA
          </DialogTitle>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-xl bg-muted hover:bg-destructive/20 flex items-center justify-center transition-all hover:scale-110"
            data-testid="button-close-modal"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Idea Text */}
          <div className="space-y-2">
            <Label htmlFor="idea-text" className="text-sm font-medium text-foreground">
              Your Idea
            </Label>
            <Textarea
              id="idea-text"
              placeholder="Describe your wild, crazy, or brilliant idea..."
              value={formData.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="resize-none min-h-[120px] focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="input-idea-text"
            />
            <div className="flex justify-between items-center text-xs">
              <span className={`text-muted-foreground ${errors.text ? 'text-destructive' : ''}`}>
                {errors.text || (isUnderMinimum && characterCount > 0 ? "Minimum 10 characters" : "")}
              </span>
              <span className={`${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount}/1000 characters
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: InsertIdea['category']) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger className="focus:ring-2 focus:ring-primary focus:border-transparent" data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <span className="text-xs text-destructive">{errors.category}</span>
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-3 py-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isAnonymous: checked as boolean }))
              }
              data-testid="checkbox-anonymous"
            />
            <Label 
              htmlFor="anonymous" 
              className="text-sm text-foreground cursor-pointer"
            >
              Submit anonymously
            </Label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-6 rounded-xl border-2 border-muted hover:border-primary transition-all font-bold text-muted-foreground hover:text-primary"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending || isOverLimit || isUnderMinimum || !formData.text.trim()}
              className="batshit-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-submit"
            >
              {submitMutation.isPending ? "🦇 Sharing..." : "🚀 Share Idea"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
