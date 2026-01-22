"use client";

import { useState, useEffect } from "react";
import { Settings, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgentPersona } from "@callmemaybe/agent-config";

interface FieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function Field({ label, description, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}

interface SettingsPanelProps {
  persona: AgentPersona;
  onSave: (persona: AgentPersona) => void;
}

export default function SettingsPanel({ persona, onSave }: SettingsPanelProps) {
  const [draft, setDraft] = useState<AgentPersona>(persona);
  const [isEditing, setIsEditing] = useState(!persona.ownerName);
  const [saved, setSaved] = useState(false);

  // Sync draft with persona when it changes externally
  useEffect(() => {
    setDraft(persona);
  }, [persona]);

  const updateDraft = <K extends keyof AgentPersona>(field: K, value: AgentPersona[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaved(false);
  };

  const isValid = Boolean(draft.ownerName?.trim());

  if (!isEditing) {
    // View mode - show saved settings
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Assistant Settings
            {saved && <Check className="w-4 h-4 text-green-500" />}
          </CardTitle>
          <CardDescription>
            Your assistant is configured for {persona.ownerName}
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-muted-foreground">{persona.ownerName}</p>
          </div>
          {persona.aboutMe && (
            <div>
              <p className="text-sm font-medium">About</p>
              <p className="text-muted-foreground">{persona.aboutMe}</p>
            </div>
          )}
          {persona.shareEmail && (
            <div>
              <p className="text-sm font-medium">Email to Share</p>
              <p className="text-muted-foreground">{persona.shareEmail}</p>
            </div>
          )}
          {persona.specialInstructions && (
            <div>
              <p className="text-sm font-medium">Special Instructions</p>
              <p className="text-muted-foreground">{persona.specialInstructions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Assistant Settings
        </CardTitle>
        <CardDescription>
          Configure how your AI assistant introduces itself and handles calls
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Field
          label="Your Name *"
          description="The assistant will answer calls on your behalf"
        >
          <Input
            value={draft.ownerName}
            onChange={(e) => updateDraft("ownerName", e.target.value)}
          />
        </Field>

        <Field
          label="About You"
          description="Brief bio to help answer questions about you"
        >
          <Textarea
            value={draft.aboutMe || ""}
            onChange={(e) => updateDraft("aboutMe", e.target.value)}
            rows={3}
          />
        </Field>

        <Field
          label="Email to Share"
          description="Leave empty if you don't want the assistant to share your email"
        >
          <Input
            type="email"
            value={draft.shareEmail || ""}
            onChange={(e) => updateDraft("shareEmail", e.target.value)}
          />
        </Field>

        <Field
          label="Special Instructions"
          description="Any custom instructions for how the assistant should behave"
        >
          <Textarea
            value={draft.specialInstructions || ""}
            onChange={(e) => updateDraft("specialInstructions", e.target.value)}
            rows={3}
          />
        </Field>
      </CardContent>

      <CardFooter className="gap-2">
        {persona.ownerName && (
          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={!isValid} className="flex-1 gap-2">
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
