'use client'

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-xl">
      <div className="text-6xl text-slate-300 mb-4">{icon}</div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
