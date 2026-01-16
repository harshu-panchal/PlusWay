import PropTypes from 'prop-types';

const Card = ({ children, className = '', padding = true, shadow = true, border = true }) => {
    return (
        <div
            className={`
                bg-white rounded-2xl
                ${padding ? 'p-6' : ''}
                ${shadow ? 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]' : ''}
                ${border ? 'border border-slate-100' : ''}
                transition-all duration-300
                ${className}
            `}
        >
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    padding: PropTypes.bool,
    shadow: PropTypes.bool,
    border: PropTypes.bool,
};

export default Card;

