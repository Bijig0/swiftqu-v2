const Urls = {
  home: '/',
  queue: (companyId: number) => `/queue/${companyId}`,
  otp: `/otp`,
  company: (companyId: number) => `/company/${companyId}`,
  emailVerifyOTP: `/verifyEmail`,
}

export default Urls
