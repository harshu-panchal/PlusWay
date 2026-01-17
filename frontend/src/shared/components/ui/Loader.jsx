const Loader = ({ size = 'md', color = 'primary', fullScreen = false }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    const colors = {
        primary: 'border-primary-600',
        secondary: 'border-secondary-600',
        white: 'border-white',
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
                <div
                    className={`
            ${sizes['lg']}
            ${colors[color]}
            border-4 border-t-transparent
            rounded-full animate-spin
          `}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            <div
                className={`
          ${sizes[size]}
          ${colors[color]}
          border-4 border-t-transparent
          rounded-full animate-spin
        `}
            />
        </div>
    );
};

export default Loader;
