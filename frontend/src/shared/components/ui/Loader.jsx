const Loader = ({ size = 'md', color = 'primary' }) => {
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
