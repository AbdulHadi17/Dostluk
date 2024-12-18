'use client';
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"

export function SearchInput({
  value,
  onChange
}) {
  return (
    (<div className="relative">
      <Search
        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4 dark:text-slate-400" />
      <Input
        type="text"
        placeholder="Search chatrooms..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8" />
    </div>)
  );
}

