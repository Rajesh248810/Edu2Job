import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = 'Edu2Job - AI Career Predictor',
    description = 'Unlock your potential with Edu2Job. Use AI to predict your ideal career, build professional resumes, and find the right jobs for your skills.',
    name = 'Edu2Job Team',
    type = 'website'
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />

            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            {/* End Twitter tags */}
        </Helmet>
    );
}

export default SEO;
