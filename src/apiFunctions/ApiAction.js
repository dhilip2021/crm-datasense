import axios from 'axios'

import { AppHeader } from './AppHeader'

export const LoginApi = async body => {
  return await axios
    .post(`/api/v1/admin/sign_in`, body)
    .then(res => {
      return res.data
    })
    .catch(err => {
      return err
    })
}

export const userPrivilegeApi = async body => {
  return await axios
    .get(`/api/v1/admin/role/list`, {
      headers: AppHeader
    })
    .then(res => {
      return res.data
    })
    .catch(err => {
      return err
    })
}

export const craeteUserApi = async (body) => {
    return await axios
      .post(`/api/v1/admin/create_user`, body, {
        headers: AppHeader,
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  };

  export const allUserListApi = async (body, header) => {
    return await axios
      .post(`/api/v1/admin/list_user`, body, {
        headers: header,
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  };

  export const getUserListApi = async (body) => {
    return await axios
      .get(`/api/v1/admin/list_user?id=${body}`,{ headers: AppHeader })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  };

  export const deleteUserApi = async (body,header) => {
    return await axios
      .delete(`/api/v1/admin/delete_user?id=${body}`, {
        headers: header,
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  };

// Leads model api's
  
export const createLead = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/lead/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postLeadListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/lead/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getLeadListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/lead/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getAllLeadListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/lead/list?orgId=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getParticularLeadListApi = async (body,name) => {
  return await axios
    .get(`/api/v1/admin/lead/list?orgId=${body}&name=${name}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteLeadApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/lead/delete?id=${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};



// Deal Model apis
export const postDealListApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/deal/list`, body, { headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getDealListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/deal/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


// Field Models apis

export const addFieldApi = async (body, header) => {
  return await axios
    .post(`/api/v1/admin/field/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postFieldListApi = async (body, header) => {
  return await axios
    .post(`/api/v1/admin/field/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getFieldListApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/field/list?id=${body}`,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

// Organization models apis
export const getOrganizationApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/organization/list?name=${body}`, { headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const addOrganizationApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/organization/add`, body,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


export const checkMailApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/check_email`, body)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const forgotPasswordApi = async (body) => {
  return await axios
    .post(`/api/v1/admin/forgot_password`, body)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


export const changePasswordApi = async (body, token) => {

  const AppHeaders ={
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }
  
  return await axios
    .post(`/api/v1/admin/change_password`, body, {
      headers: AppHeaders 
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


export const sendOtpApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/otp/send`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


// Customer model api's
  
export const createCustomer = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/customer/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postCustomerListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/customer/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getCustomerListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/customer/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteCustomerApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/customer/delete?id=${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


// Salutation model api's
  
export const createSalutation = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/salutation/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postSalutationListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/salutation/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getSalutationListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/salutation/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteSalutationApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/salutation/delete?id=${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


// Gender model api's
  
export const createGender = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/gender/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postGenderListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/gender/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getGenderListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/gender/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteGenderApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/gender/delete?id=${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

// Territory model api's
  
export const createTerritory = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/territory/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postTerritoryListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/territory/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getTerritoryListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/territory/list?is_group_param=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteTerritoryApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/territory/delete?id=${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

// Campaign type api models

export const addCampaignTypeApi = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/campaign-types`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getSinlgeCampaigntypeApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/campaign-types`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getAllCampaigntypeApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/campaign-types?page=${body.n_page}&limit=${body.n_limit}`, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const updateCampaigntypeApi = async (id,body,header) => {
  return await axios
    .put(`/api/v1/admin/campaign-types/${id}`,body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteCampaignTypeApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/campaign-types/${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


// Campaign type api models

export const addCustomersApi = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/customers`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getSinlgeCustomerseApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/customers`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getAllCustomerseApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/customers?page=${body.n_page}&limit=${body.n_limit}`, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const updateCustomerseApi = async (id,body,header) => {
  return await axios
    .put(`/api/v1/admin/customers/${id}`,body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteCustomerseApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/customers/${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getFieldFormListApi = async (body,header) => {
  return await axios
    .get(`/api/v1/admin/lead-form-template/get-list?id=${body}`,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};


export const addFieldFormApi = async (body, header) => {
  return await axios
    .post(`/api/v1/admin/lead-form-template/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};



// role model api's
  
export const createRole = async (body, header) => {
  
  return await axios.post(`/api/v1/admin/role/add`, body,{ headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const postRoleListApi = async (body,header) => {
  return await axios
    .post(`/api/v1/admin/role/list`, body, { headers: header })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const getRoleListApi = async (body) => {
  return await axios
    .get(`/api/v1/admin/role/list?name=${body}`,{ headers: AppHeader })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};

export const deleteRoleApi = async (body,header) => {
  return await axios
    .delete(`/api/v1/admin/role/delete?id=${body}`, {
      headers: header,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
};