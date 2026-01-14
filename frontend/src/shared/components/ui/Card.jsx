import PropTypes from 'prop-types';

const Card = ({ children, className = '', padding = true, shadow = true }) => {
    return (
        <div
            className={`
        bg-white rounded-lg
        ${padding ? 'p-6' : ''}
        ${shadow ? 'shadow-md hover:shadow-lg transition-shadow duration-200' : ''}
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
};

export default Card;
