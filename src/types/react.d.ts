/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react' {
  export * from '@types/react';
  export const useState: typeof import('@types/react').useState;
  export const useEffect: typeof import('@types/react').useEffect;
  export type ChangeEvent<T = Element> = import('@types/react').ChangeEvent<T>;
  export type FormEvent<T = Element> = import('@types/react').FormEvent<T>;
  export type SetStateAction<S> = import('@types/react').SetStateAction<S>;
  export type Dispatch<A> = import('@types/react').Dispatch<A>;
}

declare module 'react/jsx-runtime' {
  export * from '@types/react/jsx-runtime';
} 