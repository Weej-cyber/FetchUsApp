export default function FetchUsLogo({ className = "h-12 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 260 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Purple background rounded rectangle */}
      <rect width="260" height="70" rx="12" fill="#6366F1"/>
      
      {/* Left paw print - Gold */}
      <g transform="translate(18, 20)">
        {/* Main pad */}
        <ellipse cx="9" cy="18" rx="6" ry="7" fill="#FBBF24"/>
        {/* Toe beans */}
        <ellipse cx="4" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="10" cy="7" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="16" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
      </g>
      
      {/* FetchUs text - Poppins Extra Bold */}
      <text 
        x="50" 
        y="50" 
        fontFamily="'Poppins', 'Trebuchet MS', 'Arial Black', sans-serif" 
        fontSize="38" 
        fontWeight="800" 
        fill="#FFFFFF">
        FetchUs
      </text>
      
      {/* Right paw print - Gold */}
      <g transform="translate(223, 20)">
        {/* Main pad */}
        <ellipse cx="9" cy="18" rx="6" ry="7" fill="#FBBF24"/>
        {/* Toe beans */}
        <ellipse cx="4" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="10" cy="7" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="16" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
      </g>
    </svg>
  );
}
