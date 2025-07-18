'use client';

interface ContactFormProps {
    userEmail?: string | null;
    userPhone?: string | null;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onCountryCodeChange: (value: string) => void;
}

export default function ContactForm({ 
    userEmail,
    userPhone,
    onEmailChange,
    onPhoneChange,
    onCountryCodeChange
}: ContactFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta adresiniz</label>
                    <input type="email" 
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                           placeholder="ornek@eposta.com"
                           value={userEmail || ''}
                           onChange={(e) => onEmailChange(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cep Telefonunuz</label>
                    <div className="flex">
                        <select 
                            onChange={(e) => onCountryCodeChange(e.target.value)}
                            className="p-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none"
                        >
                            <option value="+90">🇹🇷 +90</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+32">🇧🇪 +32</option>
                            <option value="+31">🇳🇱 +31</option>
                            <option value="+41">🇨🇭 +41</option>
                            <option value="+45">🇩🇰 +45</option>
                        </select>
                        <input 
                            type="tel" 
                            className="w-full p-3 border border-gray-300 rounded-r-lg focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                            placeholder="5XX XXX XX XX" 
                            value={userPhone || ''}
                            onChange={(e) => onPhoneChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 pt-2 border-t mt-4 pt-4">
                Uçuş ve bilet bilgilerinizi e-posta ve ücretsiz SMS yoluyla ileteceğiz.
            </p>
            <div className="border-t pt-4 mt-2">
                <div className="flex items-start gap-3">
                    <input type="checkbox" id="marketing-consent" className="h-5 w-5 rounded text-green-600 focus:ring-green-500 border-gray-300 mt-1 flex-shrink-0" />
                    <label htmlFor="marketing-consent" className="text-sm text-gray-700">
                        Uçuş bilgilendirmeleri, fırsat ve kampanyalardan <a href="#" className="font-bold text-gray-800 hover:underline">Rıza Metni</a> kapsamında haberdar olmak istiyorum.
                    </label>
                </div>
                {/* Ücretsiz SMS etiketi kaldırıldı */}
            </div>
        </div>
    )
} 