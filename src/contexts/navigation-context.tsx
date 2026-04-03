'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface NavigationContextValue {
  readonly activeCategory: string | null;
  readonly setActiveCategory: (slug: string | null) => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  activeCategory: null,
  setActiveCategory: () => {},
});

export function NavigationProvider({
  children,
}: {
  readonly children: ReactNode;
}): React.ReactElement {
  const [activeCategory, setActiveCategoryState] = useState<string | null>(
    null,
  );

  const setActiveCategory = useCallback(
    (slug: string | null) => setActiveCategoryState(slug),
    [],
  );

  return (
    <NavigationContext value={{ activeCategory, setActiveCategory }}>
      {children}
    </NavigationContext>
  );
}

export function useNavigation(): NavigationContextValue {
  return useContext(NavigationContext);
}
