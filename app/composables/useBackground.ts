export const useBackground = () => {
  const variant = useState<string | null>('bg-variant', () => null)
  
  const setVariant = (v: string | null) => {
    variant.value = v
  }

  return {
    variant,
    setVariant
  }
}
