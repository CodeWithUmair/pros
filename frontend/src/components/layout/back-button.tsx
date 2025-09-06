"use client";

import { FC } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BackButton: FC = () => {
    const router = useRouter();

    return (
        <Button variant='outline2'
            onClick={() => router.back()}
            className='text-xl'
        >
            <ArrowLeft />
            Back
        </Button>
    );
};

export default BackButton;
