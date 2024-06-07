// components/ServiceSection.js
import ServiceCard from './ServiceCard';
import personIcon from '../public/image/service1.svg'; // Ensure this file is in the public folder
import personIcon2 from '../public/image/service2.svg'; // Ensure this file is in the public folder
import personIcon3 from '../public/image/service3.svg'; // Ensure this file is in the public folder
import medalIcon from '../public/image/service1model.svg'; // Ensure this file is in the public folder
import medalIcon2 from '../public/image/service2model.svg'; // Ensure this file is in the public folder
import medalIcon3 from '../public/image/service3model.svg'; 

const ServiceSection = () => {
    return (
        <div className="flex flex-col gap-4 items-center space-y-8 py-8 bg-gray-100">
            <ServiceCard
                title="Find the service"
                description="Choose from various amounts of services that fit your needs and expectations."
                buttonText="Book a Service »"
                url="/services"
                imageUrl={personIcon}
                medalIcon={medalIcon}
            />
            <ServiceCard
                title="Book a service"
                description="Book a service and wait for the service provider to come on your given location"
              
                imageUrl={personIcon2}
                medalIcon={medalIcon2}
            />
            <ServiceCard
                title="Just chill "
                description="Service Provider will come to your house and do his work, We check all the service provider before assisting you. So no need to worry."
                
                imageUrl={personIcon3}
                medalIcon={medalIcon3}
            />
        </div>
    );
};

export default ServiceSection;
