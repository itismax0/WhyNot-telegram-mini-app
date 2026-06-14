import { useState, useEffect } from "react";
import { ShieldCheck, Delete } from "lucide-react";

export const PinPad = ({
	title,
	onComplete,
	resetTrigger = 0,
}: {
	title: string;
	onComplete: (pin: string) => void;
	resetTrigger?: number;
}) => {
	const [pin, setPin] = useState("");

	useEffect(() => {
		setPin("");
	}, [resetTrigger]);

	const handlePress = (num: string) => {
		if (pin.length >= 4) return;
		const next = pin + num;
		if (next.length === 4) {
			onComplete(next);
			setPin("");
		} else {
			setPin(next);
		}
	};

	const handleDelete = () => {
		setPin((prev) => prev.slice(0, -1));
	};

	return (
		<div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-10 min-h-screen">
			<div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
				<ShieldCheck
					size={56}
					strokeWidth={1.5}
					className="mb-8 text-white opacity-90"
				/>
				<h2 className="text-xl font-medium tracking-wide mb-10 text-center">
					{title}
				</h2>

				<div className="flex gap-6 mb-16">
					{[0, 1, 2, 3].map((i) => (
						<div
							key={i}
							className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${pin.length > i ? "bg-white scale-110" : "bg-[#222]"}`}
						/>
					))}
				</div>

				<div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
						<button
							key={num}
							onClick={() => handlePress(num.toString())}
							className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-mono bg-transparent active:bg-[#1a1a1a] transition-all active:scale-95"
						>
							{num}
						</button>
					))}
					<div />
					<button
						onClick={() => handlePress("0")}
						className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-mono bg-transparent active:bg-[#1a1a1a] transition-all active:scale-95"
					>
						0
					</button>
					<button
						onClick={handleDelete}
						className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-gray-500 active:bg-[#1a1a1a] transition-all active:scale-95"
					>
						<Delete size={24} />
					</button>
				</div>
			</div>
		</div>
	);
};
