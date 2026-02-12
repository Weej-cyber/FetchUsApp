export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    success: 'btn-success',
    secondary: 'btn-secondary'
  }
  
  return (
    <button 
      className={`btn ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
