/**
 * Format date string (YYYY-MM-DD) to display format
 * Ensures consistent formatting on server and client (prevents hydration errors)
 */
export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${month}/${day}/${year}`
}

/**
 * Format date string to localized format consistently
 * Handles both ISO timestamps (2026-03-09T00:00:00.000Z) and date strings (2026-03-09)
 */
export function formatDateLocale(dateString: string): string {
  // Extract just the date part if it's an ISO timestamp
  const dateOnly = dateString.split('T')[0]

  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateOnly.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  const formatted = date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
  return formatted.replace(/ /g, '/')
}

/**
 * Check if date is valid
 */
export function isValidDate(dateString: string | null): boolean {
  if (!dateString) return false
  const dateOnly = dateString.split('T')[0]
  const date = new Date(dateOnly)
  return !isNaN(date.getTime())
}

// utils/dateFilter.ts
type Todo = {
  description: string
  priority: string
  category: string
  id: number;
  title: string;
  dueDate?: Date | string | null;
  completed: boolean;
  userId: number,
};


const TZ = "Asia/Kolkata";

export function toYmdInKolkata(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // YYYY-MM-DD
}

export function filterTodosByKolkataDate(todos: Todo[]) {
  const todayYmd = toYmdInKolkata(new Date());

  const today = todos.filter((todo) => {
    if (!todo.dueDate) return false;
    if (todo.completed) return false;
    const dueYmd = toYmdInKolkata(new Date(todo.dueDate));
    return dueYmd === todayYmd;
  });
  return {
    today
  }
}
