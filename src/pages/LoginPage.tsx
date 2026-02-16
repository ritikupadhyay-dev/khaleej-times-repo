import React from 'react';
import { useNavigate } from 'react-router-dom';
import { khaleej_times_logo } from "../assets";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/generate');
    };

    return (
        <div className="min-h-screen flex items-center justify-center border-[15px] border-[#e1b250] p-4 lg:p-0">
            <div className="w-full max-w-[1200px] aspect-[16/9] bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center space-y-8 relative">
                <div className="flex flex-col items-center">
                    <img src={khaleej_times_logo} alt='khaleej times logo' className='w-[400px] object-contain mb-4' />
                    <div className="bg-[#9c9c9c] text-white text-xs px-8 py-2 rounded-lg tracking-wider uppercase tracking-wider mb-12">
                        AI-Powered Social Publishing Engine
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-[40px] p-12 w-full max-w-[450px] border border-gray-50">
                    <h2 className="text-3xl font-[500] text-center mb-8 text-black">Sign Up</h2>
                    <form className="space-y-6" onSubmit={handleSignIn}>
                        <div>
                            <input
                                type="email"
                                placeholder="Enter Your Email"
                                className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-golden/50 text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-golden/50 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#20255C] text-white font-bold py-4 rounded-xl text-sm tracking-widest uppercase hover:bg-navy/90 transition-all shadow-lg"
                        >
                            Sign In
                        </button>
                        <p className="text-center text-xs text-gray-500">
                            Request for <a href="#" className="underline font-semibold">New Account</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
