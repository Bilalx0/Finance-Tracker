import { Coins } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';

function Balance() {
    const { summary } = useFinance();
    const availableBalance = summary?.availableBalance || 0;
    const { user } = useAuth();

    return (
        <section className="bg-[#1E2A44] flex flex-row justify-between items-center border-gray-600 border my-6 mx-4 sm:mx-8 p-4 gap-4 rounded-xl">
            <div className="text-left w-full">
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white">
                        Hey @{user?.username || 'User'}, Welcome Back!
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400">Your financial journey awaits—let's make it amazing!</p>
                </div>
                <div className="flex justify-between items-center gap-4 mt-4">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                        USD {availableBalance.toLocaleString()}
                    </span>
                    <div className="mr-0 sm:mr-5">
                        <Coins className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Balance;