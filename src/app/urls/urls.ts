const Urls = {
  home: '/',
  queue: (companySlug: string) => `/queue/${companySlug}`,
  otp: `/otp`,
  company: (companySlug: string) => `/company/${companySlug}`,
  emailVerifyOTP: `/verifyEmail`,
}

export default Urls
