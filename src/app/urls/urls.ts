const Urls = {
  home: '/',
  queue: (companyId: number) => `/queue/${companyId}`,
  otp: (companyId: number) => `/otp/${companyId}`,
  company: (companyId: number) => `/company/${companyId}`,
}

export default Urls
