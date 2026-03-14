import React from 'react';
import InteractiveElement from './InteractiveElement.js';

const e = React.createElement;

function About() {
    return e('section', { id: 'about', className: 'py-20 md:py-32' },
        e('div', { className: 'container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center' },
            e(InteractiveElement, { depth: 0.003 },
                e('img', { src: 'https://officebanao.com/wp-content/uploads/2025/03/modern-minimalist-office-black-white-1-1200x675.jpg', alt: 'A sleek, modern high-tech corporate office', className: 'rounded-lg shadow-2xl object-cover w-full h-full' })
            ),
            e(InteractiveElement, { depth: 0.003 },
                e('h2', { className: 'text-4xl md:text-5xl font-serif text-brand-light mb-6' }, 'Digital Asset Excellence. ', e('br'), 'Institutional-Grade Performance.'),
                e('p', { className: 'text-brand-light/80 leading-relaxed mb-4' }, 'THE DIGITAL TRADING represents the evolution of digital asset management, combining institutional-grade infrastructure with cutting-edge algorithmic trading strategies. We leverage advanced blockchain technology and quantitative analysis to deliver superior risk-adjusted returns in the digital asset ecosystem.'),
                e('p', { className: 'text-brand-light/80 leading-relaxed' }, 'Our platform provides sophisticated investors with access to professional-grade digital asset strategies, comprehensive risk management, and transparent performance reporting. We are committed to setting new standards in digital asset investment excellence.')
            )
        )
    );
}

export default About;
