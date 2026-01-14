import {
    Tag,
    Shield,
    Cable,
    Headphones,
    Car,
    Watch,
    Speaker,
    Battery
} from 'lucide-react';

const CategoryIcons = () => {
    const categories = [
        {
            id: 1,
            name: 'Sale',
            icon: Tag,
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            hoverBg: 'hover:bg-red-100',
        },
        {
            id: 2,
            name: 'Screen protectors',
            icon: Shield,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            hoverBg: 'hover:bg-blue-100',
        },
        {
            id: 3,
            name: 'Cables and adapters',
            icon: Cable,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            hoverBg: 'hover:bg-purple-100',
        },
        {
            id: 4,
            name: 'Headphones',
            icon: Headphones,
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-50',
            hoverBg: 'hover:bg-cyan-100',
        },
        {
            id: 5,
            name: 'Car holders',
            icon: Car,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            hoverBg: 'hover:bg-green-100',
        },
        {
            id: 6,
            name: 'Smart watches',
            icon: Watch,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-50',
            hoverBg: 'hover:bg-indigo-100',
        },
        {
            id: 7,
            name: 'Speakers',
            icon: Speaker,
            color: 'text-pink-500',
            bgColor: 'bg-pink-50',
            hoverBg: 'hover:bg-pink-100',
        },
        {
            id: 8,
            name: 'Chargers',
            icon: Battery,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            hoverBg: 'hover:bg-orange-100',
        },
    ];

    return (
        <div className="flex md:grid md:grid-cols-8 gap-4 overflow-x-auto pb-6 md:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
            {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                    <button
                        key={category.id}
                        className="flex-shrink-0 w-24 md:w-auto flex flex-col items-center justify-center gap-3 group cursor-pointer snap-start"
                    >
                        <div className={`
                            w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                            ${category.bgColor} group-hover:shadow-lg group-hover:-translate-y-1 group-hover:scale-105
                        `}>
                            <IconComponent
                                className={`w-7 h-7 md:w-9 md:h-9 ${category.color} transition-transform duration-300 group-hover:scale-110`}
                                strokeWidth={1.5}
                            />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors text-center leading-tight tracking-wide">
                            {category.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryIcons;
