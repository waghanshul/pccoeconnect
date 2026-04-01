export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Chat bubble shape */}
        <path
          d="M4 6C4 4.89543 4.89543 4 6 4H22C23.1046 4 24 4.89543 24 6V18C24 19.1046 23.1046 20 22 20H10L6 24V20H6C4.89543 20 4 19.1046 4 18V6Z"
          className="fill-primary"
        />
        <text
          x="14"
          y="14.5"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-primary-foreground"
          fontSize="9"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          CP
        </text>
      </svg>
      <span className="text-base font-semibold tracking-tight text-foreground">
        ChatPCCOE
      </span>
    </div>
  );
};
