const OnTopBlurOverlay = ({
  title = "Coming soon",
  description = "This feature is coming soon",
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="flex absolute inset-0 bg-background/20 border backdrop-blur-md overflow-hidden select-none min-h-svh items-center justify-center">
      <div className="p-6 md:p-10 flex flex-col gap-1 text-center">
        <h3 className="text-lg text-foreground/80">{title}</h3>
        <h3 className="text-sm text-muted-foreground">{description}</h3>
      </div>
    </div>
  );
};

export default OnTopBlurOverlay;
